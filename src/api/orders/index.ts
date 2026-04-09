import { supabase } from "@/lib/supabase";
import { useAuth } from "@/Providers/AuthProvider";
import { Tables } from "@assets/types";
import { InsertTables } from "@assets/types";
import { UpdateTables } from "@assets/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

type UseOrderListOptions = {
  archived?: boolean;
};

const activeOrderStatuses =  ["New", "Cooking", "Delivering"];
const archivedOrderStatuses = [ "Delivered"]
export const useOrderList = ({
  archived = false,
}: UseOrderListOptions = {}) => {
  return useQuery<Tables<"orders">[]>({
    queryKey: ["orders", { archived },],
    queryFn: async (): Promise<Tables<"orders">[]> => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (archived) {
        query = query.in("status", archivedOrderStatuses);
      } else {
        query = query.in("status", activeOrderStatuses);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
};

export const useMyOrdersList = () => {
  const { session } = useAuth();
  const id = session?.user.id;

  return useQuery<Tables<"orders">[]>({
    queryKey: ["orders", { userId: id }],
    queryFn: async (): Promise<Tables<"orders">[]> => {
      if (!id) {
        return [];
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
};

export const useMyOrderList = useMyOrdersList;
export const useAdminOrderList = useOrderList;

export const useOrderDetails = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))") // quantity and size from order_item , name and image from products
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertOrder = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    async mutationFn(data: InsertTables<"orders">) {
      const { error, data: newProduct } = await supabase
        .from("orders")
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newProduct;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updateFields,
    }: {
      id: number;
      updateFields: UpdateTables<"orders">;
    }) {
      const { error, data: updatedOrder } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return updatedOrder;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
};

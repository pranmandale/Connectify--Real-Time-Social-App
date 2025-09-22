import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosNodeClient } from "../../services/axiosInstance";

// -------------------- FETCH COMMENTS --------------------
export const useFetchComments = (contentType, contentId) => {
  return useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: async () => {
      const res = await axiosNodeClient.get(`/comment/getComments/${contentType}/${contentId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    keepPreviousData: true,    // keep old data while fetching new
  });
};

// -------------------- ADD COMMENT --------------------
// export const useAddComment = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     async ({ contentType, contentId, content }) => {
//       const res = await axiosNodeClient.post(`/comment/addComment/${contentType}/${contentId}`, { content });
//       return { data: res.data, contentType, contentId };
//     },
//     {
//       onSuccess: (data) => {
//         // Update cache immediately
//         queryClient.setQueryData(['comments', data.contentType, data.contentId], (old) => ({
//           comments: [data.data.comment, ...(old?.comments || [])],
//           commentCount: data.data.commentCount,
//         }));
//       },
//     }
//   );
// };

// export const useAddComment = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     async ({ contentType, contentId, content }) => {
//       const res = await axiosNodeClient.post(`/comment/addComment/${contentType}/${contentId}`, { content });
//       return { data: res.data, contentType, contentId };
//     },
//     {
//       onSuccess: (data) => {
//         // Update cached comments immediately
//         queryClient.setQueryData(['comments', data.contentType, data.contentId], (old) => ({
//           comments: [data.data.comment, ...(old?.comments || [])],
//           commentCount: data.data.commentCount,
//         }));
//       },
//     }
//   );
// };



export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentType, contentId, content }) => {
      const res = await axiosNodeClient.post(`/comment/addComment/${contentType}/${contentId}`, { content });
      return { data: res.data, contentType, contentId };
    },
    onSuccess: ({ data, contentType, contentId }) => {
      queryClient.setQueryData(['comments', contentType, contentId], (old) => ({
        comments: [data.comment, ...(old?.comments || [])],
        commentCount: data.commentCount,
      }));
    },
  });
};

// -------------------- ADD REPLY --------------------
// export const useAddReply = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     async ({ commentId, content, contentType, contentId }) => {
//       const res = await axiosNodeClient.post(`/comment/replyComment/${commentId}`, { content });
//       return { ...res.data, commentId, contentType, contentId };
//     },
//     {
//       onSuccess: (data) => {
//         // Invalidate the comments query to refetch updated data
//         queryClient.invalidateQueries(['comments', data.contentType, data.contentId]);
//       },
//     }
//   );
// };

// // -------------------- DELETE COMMENT --------------------
// export const useDeleteComment = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     async ({ commentId }) => {
//       const res = await axiosNodeClient.delete(`/comment/deleteComment/${commentId}`);
//       return res.data;
//     },
//     {
//       onSuccess: (_, variables) => {
//         // Invalidate all comment queries, or selectively based on contentType/contentId if available
//         queryClient.invalidateQueries({ queryKey: ['comments'] });
//       },
//     }
//   );
// };



export const useAddReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, content, contentType, contentId }) => {
      const res = await axiosNodeClient.post(`/comment/replyComment/${commentId}`, { content });
      return { ...res.data, commentId, contentType, contentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['comments', data.contentType, data.contentId]);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId }) => {
      const res = await axiosNodeClient.delete(`/comment/deleteComment/${commentId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

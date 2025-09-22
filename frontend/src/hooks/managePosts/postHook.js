import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosNodeClient } from "../../services/axiosInstance";

// ✅ Fetch all posts
export const useAllPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axiosNodeClient.get("/post/post/get-all");
      return res.data.posts;
    },
    staleTime: 60000, // 1 min before refetch
    cacheTime: 300000, // 5 min cache
  });
};

// ✅ Fetch single post
export const usePostById = (postId) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axiosNodeClient.get(`/post/post/${postId}`);
      return res.data.post;
    },
    enabled: !!postId, // fetch only if postId exists
    staleTime: 60000,
  });
};

// ✅ Upload post
export const usePostUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosNodeClient.post(`/post/post/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.post;
    },
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (old) => [newPost, ...(old || [])]);
    },
  });
};

// ✅ Update post
export const usePostUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, formData }) => {
      const res = await axiosNodeClient.put(`/post/post/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.post;
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return [];
        return old.map((p) => (p._id === updatedPost._id ? updatedPost : p));
      });
      queryClient.setQueryData(["post", updatedPost._id], updatedPost);
    },
  });
};

// ✅ Delete post
export const usePostDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId) => {
      await axiosNodeClient.delete(`/post/post/${postId}`);
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.setQueryData(["posts"], (old) => old?.filter((p) => p._id !== postId) || []);
      queryClient.removeQueries(["post", postId]);
    },
  });
};

// ✅ Suggested posts
export const usePostSuggested = () => {
  return useQuery({
    queryKey: ["suggested-posts"],
    queryFn: async () => {
      const res = await axiosNodeClient.get("/post/post/getSuggested");
      return res.data.posts;
    },
    staleTime: 60000,
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosNodeClient } from "../../services/axiosInstance";


export const useFetchStory = () => {
    return useQuery({
    queryKey : ['allStories'],
    queryFn : async () => {
        const res = await axiosNodeClient.get('/story/getAllStories');
        return res.data.stories;
    },
    staleTime : 60000,
    cacheTime : 300000,
    })
}

export const useFetchStoryById = (storyId) => {
    return useQuery({
        queryKey : ['story', storyId],
        queryFn : async () => {
            const res = await axiosNodeClient.get(`/story/getStoryDetails/${storyId}`,);
            return res.data.story
        },
        staleTime : 60000,
        cacheTime : 300000,
    })
}


export const useUploadStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn : async (formData) => {
            const res = await axiosNodeClient.post('/story/uploadStory', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            return res.data.story;
        },
        onSuccess : (newStory) => {
            queryClient.setQueryData(['AllStories'], (old) => [newStory, ...(old || [])]);
        }
    })
}



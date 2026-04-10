import { apiSlice } from "./apiSlice";

export const topicApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getTopics: build.query({
      query: (params) => ({ url: "/topics", params }),
      providesTags: ["Topics"],
    }),
    createTopic: build.mutation({
      query: (body) => ({ url: "/topics", method: "POST", body }),
      invalidatesTags: ["Topics", "Chapters"],
    }),
    updateTopic: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/topics/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Topics", "Chapters"],
    }),
    deleteTopic: build.mutation({
      query: (id) => ({ url: `/topics/${id}`, method: "DELETE" }),
      invalidatesTags: ["Topics", "Chapters"],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicApi;

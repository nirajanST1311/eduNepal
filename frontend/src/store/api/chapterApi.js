import { apiSlice } from "./apiSlice";

export const chapterApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChapters: build.query({
      query: (params) => ({ url: "/chapters", params }),
      providesTags: ["Chapters"],
    }),
    getChapter: build.query({
      query: (id) => `/chapters/${id}`,
      providesTags: (r, e, id) => [{ type: "Chapters", id }],
    }),
    createChapter: build.mutation({
      query: (body) => ({ url: "/chapters", method: "POST", body }),
      invalidatesTags: ["Chapters"],
    }),
    updateChapter: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/chapters/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Chapters"],
    }),
    deleteChapter: build.mutation({
      query: (id) => ({ url: `/chapters/${id}`, method: "DELETE" }),
      invalidatesTags: ["Chapters"],
    }),
  }),
});

export const {
  useGetChaptersQuery,
  useGetChapterQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chapterApi;

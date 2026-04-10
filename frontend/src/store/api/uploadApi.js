import { apiSlice } from "./apiSlice";

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    uploadFile: build.mutation({
      query: (formData) => ({ url: "/upload", method: "POST", body: formData }),
    }),
  }),
});

export const { useUploadFileMutation } = uploadApi;

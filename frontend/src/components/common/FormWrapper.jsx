import { FormProvider, useForm } from "react-hook-form";
import { Box } from "@mui/material";

/**
 * Wraps children in react-hook-form FormProvider + <form> element.
 *
 * Props:
 * - defaultValues: initial form values
 * - onSubmit: (data) => Promise | void
 * - formOptions: extra useForm options (mode, resolver, etc.)
 * - sx: Box sx overrides
 * - children: form content (use ControlledTextField, etc.)
 */
export default function FormWrapper({
  defaultValues = {},
  onSubmit,
  formOptions = {},
  children,
  ...boxProps
}) {
  const methods = useForm({
    defaultValues,
    mode: "onTouched",
    ...formOptions,
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    if (onSubmit) await onSubmit(data, methods);
  });

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit} noValidate {...boxProps}>
        {typeof children === "function" ? children(methods) : children}
      </Box>
    </FormProvider>
  );
}

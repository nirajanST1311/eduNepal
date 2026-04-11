import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

/**
 * Controlled text field — must be used inside <FormWrapper>.
 */
export function ControlledTextField({ name, rules, label, ...props }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          error={!!error}
          helperText={error?.message || props.helperText || " "}
          fullWidth={props.fullWidth ?? true}
          value={field.value ?? ""}
        />
      )}
    />
  );
}

/**
 * Controlled password field with visibility toggle.
 */
export function ControlledPasswordField({ name, rules, label, ...props }) {
  const { control } = useFormContext();
  const [show, setShow] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          type={show ? "text" : "password"}
          error={!!error}
          helperText={error?.message || props.helperText || " "}
          fullWidth={props.fullWidth ?? true}
          value={field.value ?? ""}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShow((v) => !v)}
                    edge="end"
                    tabIndex={-1}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}

/**
 * Controlled select field.
 */
export function ControlledSelect({
  name,
  rules,
  label,
  options = [],
  ...props
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth={props.fullWidth ?? true}
          error={!!error}
          size={props.size || "small"}
        >
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} value={field.value ?? ""} {...props}>
            {options.map((opt) => (
              <MenuItem
                key={opt.value ?? opt}
                value={opt.value ?? opt}
              >
                {opt.label ?? opt}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message || " "}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

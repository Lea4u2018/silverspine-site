/** Red asterisk for required form fields. */
export function RequiredMark() {
  return (
    <span className="text-red-400 font-semibold ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

/** Short note at the top of a form. */
export function FormRequiredNote({ className = "text-xs text-gray-500 mb-4" }) {
  return (
    <p className={className}>
      Fields marked with <RequiredMark /> are required.
    </p>
  );
}

/**
 * Label for public forms — optional red asterisk for required fields.
 */
export default function FormFieldLabel({
  htmlFor,
  children,
  required = false,
  optional = false,
  className = "block text-sm mb-1 text-gray-300",
}) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
      {required ? <RequiredMark /> : null}
      {optional ? <span className="text-gray-500 font-normal"> (optional)</span> : null}
    </label>
  );
}

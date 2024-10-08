import Form from "@/components/form";
import "@/app/appointForm/initial.css";

export default async function appointForm() {
  return (
    <div>
      <h1 className = "heading">Appointment Form</h1>
      <Form></Form>
    </div>
  );
}

"use server";

export async function test(prevState: unknown, formData: FormData) {
  //simulate a delay of 2 seconds
  console.log("server action called");
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

export async function sendMessage(formData: FormData) {
  "use server";

  const message = formData.get("message");

  if (message) {
    // Here you would typically send the message to the server or handle it accordingly
    console.log(`Message sent: ${message}`);
  } else {
    console.error("No message provided");
  }
}

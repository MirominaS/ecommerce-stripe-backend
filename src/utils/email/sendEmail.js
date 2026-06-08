import { getConfig } from "../getConfig.js";

const sendEmail = async ({ to, subject, html, text, cc }) => {
  try {
    const apiUrl = await getConfig("EMAIL_API_URL");
    const apiKey = await getConfig("EMAIL_API_KEY");
    const emailFrom = await getConfig( "EMAIL_FROM");

  console.log({
  apiUrl,
  apiKey: apiKey ? "FOUND" : "MISSING",
  emailFrom,
});

    if (!to || !subject || !html) {
      throw new Error("Missing email fields");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: emailFrom,
        },
        to: [
          {
            email: to,
          },
        ],
        cc: cc
          ? [
              {
                email: cc,
              },
            ]
          : undefined,
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return await response.json();
  } catch (error) {
    console.error("Email send failed", error.message);
    throw error;
  }
};

export default sendEmail;

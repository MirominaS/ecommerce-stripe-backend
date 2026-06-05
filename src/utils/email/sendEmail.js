const sendEmail = async ({ to, subject, html, text, cc }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email fields");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.EMAIL_FROM,
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

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (file, folder) => {
  const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
  console.log({
    bucket: process.env.R2_BUCKET,
    bucketType: typeof process.env.R2_BUCKET,
    bucketLength: process.env.R2_BUCKET?.length,
  });

  const params = {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));

  return {
    key,
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
};

export const deleteFromR2 = async (key) => {
  console.log("Deleting key:", key);

  const decodedKey = decodeURIComponent(key);
  const result = await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: decodedKey,
    }),
  );
  console.log("RESULT:", result);
  return true;
};

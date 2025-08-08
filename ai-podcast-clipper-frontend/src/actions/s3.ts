/**
 * S3 Upload Server Actions
 * ========================
 *
 * Handles secure file upload to AWS S3 with pre-signed URLs.
 * Includes credit validation and database tracking for uploaded files.
 *
 * Features:
 * - Pre-signed URL generation for secure uploads
 * - Credit validation before upload
 * - File metadata tracking in database
 * - User authentication verification
 * - UUID-based file naming for uniqueness
 *
 * Author: Deepak Singhal
 */

"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "~/server/db";

export async function generateUploadUrl(fileInfo: {
  filename: string;
  contentType: string;
}): Promise<{
  success: boolean;
  signedUrl: string;
  key: string;
  uploadedFileId: string;
}> {
  // Verify user authentication
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Validate user has sufficient credits before allowing upload
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { credits: true },
  });

  if (user.credits < 1) {
    throw new Error(
      "Insufficient credits. Please purchase more credits to upload videos.",
    );
  }

  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileExtension = fileInfo.filename.split(".").pop() ?? "";

  const uniqueId = uuidv4();
  const key = `${uniqueId}/original.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileInfo.contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

  const uploadedFileDbRecord = await db.uploadedFile.create({
    data: {
      userId: session.user.id,
      s3Key: key,
      displayName: fileInfo.filename,
      uploaded: false,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    signedUrl,
    key,
    uploadedFileId: uploadedFileDbRecord.id,
  };
}

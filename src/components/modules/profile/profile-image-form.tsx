"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage, useGetMe, useUpdateProfileImage } from "@/hooks";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const MAX_SIZE_MB = 5;

export default function ProfileImageForm() {
  const { data } = useGetMe();
  const currentImage = data?.data?.imageUrl ?? null;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useUpdateProfileImage();

  const src = preview ?? currentImage;
  // Blob previews from URL.createObjectURL can't go through the optimizer.
  const isBlobPreview = src?.startsWith("blob:") ?? false;

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Invalid file", { description: "Please choose an image file." });
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("File too large", {
        description: `Image must be under ${MAX_SIZE_MB}MB.`,
      });
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await mutateAsync(file);
      toast.success("Profile photo updated", {
        description: "Your new photo is now visible.",
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      toast.error("Upload failed", {
        description: getApiErrorMessage(error, "Could not upload the image."),
      });
    }
  };

  return (
    <DashboardPanel
      title="Profile photo"
      subtitle="Upload a square image — JPG or PNG, up to 5MB."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {src ? (
          <Image
            src={src}
            alt={preview ? "Selected photo preview" : "Current profile photo"}
            width={80}
            height={80}
            unoptimized={isBlobPreview}
            className="size-20 shrink-0 rounded-2xl border object-cover"
          />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <ImagePlus className="size-6" />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleSelect(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isPending}
            >
              {isPending ? (
                <>
                  <Spinner /> Uploading…
                </>
              ) : (
                "Upload photo"
              )}
            </Button>
            {file ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

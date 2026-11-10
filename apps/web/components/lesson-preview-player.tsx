"use client";

import { useState } from "react";
import { Button, Dialog } from "@zharfa/ui";

export function LessonWatch({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        مشاهده
      </Button>
      <Dialog
        open={open}
        title={title}
        indexLabel=""
        footnote={null}
        cancelLabel="بستن"
        onCancel={() => setOpen(false)}
        className="lesson-dialog"
      >
        <video
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          disableRemotePlayback
          autoPlay
          playsInline
          preload="metadata"
          src={src}
          aria-label={title}
          onContextMenu={(event) => event.preventDefault()}
        />
        <p className="lesson-dialog__note">این ویدیو فقط برای مشاهده است و دانلود ندارد.</p>
      </Dialog>
    </>
  );
}

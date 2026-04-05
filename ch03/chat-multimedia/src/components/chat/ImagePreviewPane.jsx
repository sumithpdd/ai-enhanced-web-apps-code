'use client';

/**
 * Large preview for the image attached to the next (or last) multimodal message,
 * matching the split chat + preview layout from the book UI.
 */
export default function ImagePreviewPane({
  previewDataUrl,
  fileLabel,
  hasPendingImage,
  onClearPending,
  onDismissSent,
}) {
  const showDismissSent = !hasPendingImage && previewDataUrl && onDismissSent;

  return (
    <aside
      className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start w-full lg:max-w-[min(46vw,520px)] shrink-0"
      aria-label="Image attachment preview"
    >
      {previewDataUrl ? (
        <>
          <div className="rounded-xl border border-border bg-muted/40 overflow-hidden shadow-sm">
            <img
              src={previewDataUrl}
              alt={fileLabel ? `Preview: ${fileLabel}` : 'Selected image preview'}
              className="w-full max-h-[min(70vh,640px)] object-contain bg-black/[0.03] dark:bg-black/20"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            {fileLabel ? (
              <span className="truncate font-medium text-foreground/80" title={fileLabel}>
                {fileLabel}
              </span>
            ) : (
              <span>Attached image</span>
            )}
            <div className="flex gap-2 shrink-0">
              {hasPendingImage && (
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={onClearPending}
                >
                  Remove
                </button>
              )}
              {showDismissSent ? (
                <button
                  type="button"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                  onClick={onDismissSent}
                >
                  Hide preview
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 min-h-[200px] lg:min-h-[min(50vh,360px)] flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
          <span className="text-4xl" aria-hidden>
            🖼️
          </span>
          <p className="text-sm max-w-[240px]">
            Upload an image to see a large preview here. It will be sent with your next message.
          </p>
        </div>
      )}
    </aside>
  );
}

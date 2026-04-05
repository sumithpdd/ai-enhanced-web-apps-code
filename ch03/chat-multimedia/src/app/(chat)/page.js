'use client';
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import ChatList from '@/components/chat/ChatList';
import FileUploader from '@/components/FileUploader';
import ImagePreviewPane from '@/components/chat/ImagePreviewPane';
import useEnterSubmit from '@/hooks/use-enter-submit';
import useFocusOnSlashPress from '@/hooks/use-focus-on-slash-press';

import { useChat } from 'ai/react';
import { ScrollArea } from '@radix-ui/react-scroll-area';

const Chat = () => {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: '/api' });
  const messageEndRef = React.useRef(null);
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /** Image selected in the form, not yet sent (raw base64 + mime for the API body). */
  const [pendingImage, setPendingImage] = React.useState(null);
  /** After send: keep showing the image on the right like the reference UI. */
  const [sentImagePreview, setSentImagePreview] = React.useState(null);

  const previewDataUrl = pendingImage
    ? `data:${pendingImage.mimeType};base64,${pendingImage.base64}`
    : sentImagePreview?.dataUrl ?? null;

  const previewFileLabel = pendingImage?.name ?? sentImagePreview?.name ?? null;

  const handleUploadFile = async (file, base64, mimeType) => {
    setSentImagePreview(null);
    setPendingImage({
      base64,
      mimeType: mimeType || file.type || 'image/jpeg',
      name: file.name,
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const data = { message: e.target.value };
    if (pendingImage) {
      data.imageUrl = pendingImage.base64;
      data.imageMimeType = pendingImage.mimeType;
      setSentImagePreview({
        dataUrl: `data:${pendingImage.mimeType};base64,${pendingImage.base64}`,
        name: pendingImage.name,
      });
      setPendingImage(null);
    }
    handleSubmit(e, { data });
  };

  const clearPendingImage = () => setPendingImage(null);
  const dismissSentPreview = () => setSentImagePreview(null);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const uploaderFileName = pendingImage?.name ?? null;

  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 py-6 min-h-0">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 flex-1 min-h-0 items-stretch">
        {/* Chat column (left on large screens) */}
        <div className="flex flex-col flex-1 min-w-0 min-h-[50vh] lg:min-h-[calc(100vh-10rem)] relative pb-44">
          <ScrollArea className="relative flex-1 min-h-0 pr-2 pb-4">
            {messages.length === 0 && (
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mt-4 mb-12">
                <span className="inline-block">Hello, I&apos;m ✴️ Astra</span>
                <br />
                <span className="text-gray-400">Ask me anything — add a photo for multimodal questions</span>
              </h1>
            )}
            {messages.length > 0 && <ChatList messages={messages} isLoading={isLoading} />}
            <div ref={messageEndRef} />
          </ScrollArea>

          <form
            className="absolute bottom-0 left-0 right-0 z-10"
            ref={formRef}
            role="form"
            aria-labelledby="chat-form-label"
            onSubmit={handleOnSubmit}
          >
            <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="flex items-center justify-between gap-2 pb-2">
                <FileUploader
                  onFileUpload={handleUploadFile}
                  maxFileSize={10 * 1024 * 1024}
                  fileName={uploaderFileName}
                />
              </div>
              <Textarea
                ref={inputRef}
                className="w-full resize-none"
                placeholder="Type your message here..."
                tabIndex={0}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
              />
            </div>
          </form>
        </div>

        {/* Image preview (right on large screens; below chat on small screens) */}
        <ImagePreviewPane
          previewDataUrl={previewDataUrl}
          fileLabel={previewFileLabel}
          hasPendingImage={Boolean(pendingImage)}
          onClearPending={clearPendingImage}
          onDismissSent={dismissSentPreview}
        />
      </div>
    </div>
  );
};

export default Chat;

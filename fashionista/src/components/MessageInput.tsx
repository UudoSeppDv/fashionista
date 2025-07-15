import React, { useState } from 'react';
import Image from 'next/image';

type MessageInputProps = {
  onSend: (args: { text: string; image: File | null }) => Promise<void>;
  sending: boolean;
};

const MessageInput: React.FC<MessageInputProps> = ({ onSend, sending }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    await onSend({ text: newMessage.trim(), image: selectedImage });
    setNewMessage('');
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
  };

  // Faili eelvaate URL, et pilti kuvada
  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div className="flex flex-col gap-2 m-2">
      {/* Kui on valitud pilt, näita väikest eelvaadet koos ristiga */}
      {previewUrl && (
        <div className="relative inline-block w-24 h-24 border border-gray-600 rounded overflow-hidden">
  <Image
    src={previewUrl}
    alt="Valitud pilt"
    fill
    style={{ objectFit: 'cover' }}
  />
  <button
    type="button"
    onClick={() => setSelectedImage(null)}
    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-bl px-1 hover:bg-opacity-75"
  >
    ✕
  </button>
</div>

      )}

      <div className="flex gap-2 items-center">
        {/* Pildi lisamise nupp */}
        <label className="text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer m-1 p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 5H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M19 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M21 11.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M21 15.0002L17.914 11.9142C17.5389 11.5392 17.0303 11.3286 16.5 11.3286C15.9697 11.3286 15.4611 11.5392 15.086 11.9142L6 21.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={sending}
          />
        </label>

<div className="relative w-full">
  <input
    className="w-full border border-gray-600 p-2 pr-10 rounded"
    placeholder="Sisesta sõnum..."
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyDown={async (e) => {
      if (e.key === 'Enter' && !sending) {
        e.preventDefault();
        await handleSend();
      }
    }}
    disabled={sending}
  />

  {/* Saada ikoon inputi sees */}
  <button
    type="button"
    onClick={handleSend}
    disabled={sending}
    className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5358 21.6861C14.5738 21.7807 14.6398 21.8615 14.7251 21.9176C14.8103 21.9737 14.9107 22.0023 15.0126 21.9997C15.1146 21.9971 15.2134 21.9633 15.2956 21.903C15.3779 21.8426 15.4397 21.7586 15.4728 21.6621L21.9728 2.66206C22.0048 2.57345 22.0109 2.47756 21.9904 2.38561C21.9699 2.29366 21.9236 2.20945 21.857 2.14283C21.7904 2.07622 21.7062 2.02995 21.6143 2.00945C21.5223 1.98894 21.4264 1.99505 21.3378 2.02706L2.33781 8.52706C2.2413 8.56015 2.15723 8.62197 2.09688 8.70423C2.03652 8.78648 2.00278 8.88523 2.00016 8.98722C1.99755 9.0892 2.0262 9.18955 2.08226 9.27478C2.13833 9.36002 2.21912 9.42606 2.31381 9.46406L10.2438 12.6441C10.4945 12.7444 10.7223 12.8945 10.9134 13.0853C11.1045 13.2761 11.255 13.5036 11.3558 13.7541L14.5358 21.6861Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.8541 2.14697L10.9141 13.086" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>
      </div>
    </div>
  );
};

export default MessageInput;

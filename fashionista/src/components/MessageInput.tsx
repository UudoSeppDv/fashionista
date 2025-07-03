import React, { useState } from 'react';

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
    <div className="flex flex-col gap-2 mt-2">
      {/* Kui on valitud pilt, näita väikest eelvaadet koos ristiga */}
      {previewUrl && (
        <div className="relative inline-block w-24 h-24 border rounded overflow-hidden">
          <img
            src={previewUrl}
            alt="Valitud pilt"
            className="w-full h-full object-cover"
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
        <label className="cursor-pointer p-2 border rounded bg-gray-100 hover:bg-gray-200">
          📷
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={sending}
          />
        </label>

        {/* Tekstisisestus */}
        <input
          className="flex-1 border rounded p-2"
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

        {/* Saada nupp */}
        <button
          onClick={handleSend}
          disabled={sending}
          className={`px-4 rounded text-white ${
            sending ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
        >
          {sending ? 'Saadan...' : 'Saada'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

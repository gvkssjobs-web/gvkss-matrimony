'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface PhotoCaptureProps {
  onPhotoCapture: (photoPath: string | null) => void;
  label?: string;
}

export default function PhotoCapture({ onPhotoCapture, label = 'Profile Photo' }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup blob URLs
      if (photo && photo.startsWith('blob:')) {
        URL.revokeObjectURL(photo);
      }
    };
  }, [photo]);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err: any) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            await uploadPhoto(blob);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const uploadPhoto = async (file: File | Blob) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      const fileToUpload = file instanceof File ? file : new File([file], 'photo.jpg', { type: 'image/jpeg' });
      formData.append('photo', fileToUpload);

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.path) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(fileToUpload);
        setPhoto(previewUrl);
        setPhotoPath(data.path);
        onPhotoCapture(data.path);
      } else {
        setError(data.error || 'Failed to upload photo');
        onPhotoCapture(null);
      }
    } catch (err: any) {
      setError('Failed to upload photo. Please try again.');
      console.error('Upload error:', err);
      onPhotoCapture(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          return;
        }
        await uploadPhoto(file);
      } else {
        setError('Please select an image file');
      }
    }
  };

  const removePhoto = () => {
    if (photo && photo.startsWith('blob:')) {
      URL.revokeObjectURL(photo);
    }
    setPhoto(null);
    setPhotoPath(null);
    onPhotoCapture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-2">
        {label} (Optional)
      </label>

      {photo ? (
        <div className="relative">
          <img
            src={photo}
            alt="Profile photo"
            className="w-full h-48 object-cover rounded-lg border border-zinc-300"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-2 right-2 text-white rounded-full p-2 text-sm transition-colors"
            style={{ backgroundColor: '#E94B6A' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C7365A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E94B6A'}
            title="Remove photo"
            disabled={isUploading}
          >
            ✕
          </button>
          {photoPath && (
            <p className="text-xs text-zinc-500  mt-1">
              Photo saved: {photoPath.split('/').pop()}
            </p>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-300  rounded-lg p-6 text-center">
          <p className="text-sm text-zinc-600  mb-4">
            No photo selected
          </p>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-48 object-cover rounded-lg border border-zinc-300"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="success"
              onClick={capturePhoto}
              fullWidth
              disabled={isUploading}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Capture Photo'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={stopCamera}
              fullWidth
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!isCapturing && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={startCamera}
            fullWidth
            disabled={isUploading}
          >
            📷 Take Photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            disabled={isUploading}
          >
            📁 Choose File
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
      )}
    </div>
  );
}

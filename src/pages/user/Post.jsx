import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../../hooks/usePost';
import { useAuth } from '../../context/AuthContext';
import api, { extractError } from '../../services/api';

export default function Post() {
  const { createPost } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [elevation, setElevation] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max is 10MB.");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError("Invalid file type: only images and videos are allowed.");
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.data?.url) {
        setMediaUrl(res.data.data.url);
        setMediaType(isImage ? 'image' : 'video');
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createPost({
        media_url: mediaUrl,
        media_type: mediaType,
        title: title.trim(),
        description: story.trim(),
        distance: parseFloat(distance) || 0,
        duration: time.trim(),
        elevation: parseInt(elevation) || 0,
        location: location.trim(),
        tags: tags.trim(),
        user_id: user?.id || 1,
      });

      // Redirect back to Home feed to see the post
      navigate('/');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="bg-[#caf300] border-4 border-black p-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#171e00]">
          SHARE YOUR RIDE
        </h1>
      </div>

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
          <p className="font-mono text-label-md text-on-error-container">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Post Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ride Title */}
          <div className="flex flex-col">
            <label className="bg-[#7df4ff] text-black border-2 border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 w-fit -mb-1 ml-4 relative z-10 block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              RIDE TITLE
            </label>
            <input
              type="text"
              placeholder="GIVE YOUR RIDE A RAD NAME..."
              className="w-full bg-white border-4 border-black p-4 font-display text-xl font-black placeholder:text-gray-400 focus:bg-[#f4f5df] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload Container */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!mediaUrl && !uploading ? onButtonClick : undefined}
            className={`border-4 border-black border-dashed p-8 flex flex-col justify-center items-center text-center min-h-[300px] relative transition-colors ${
              dragActive ? 'bg-[#caf300]/20 border-[#caf300]' : 'bg-[#f4f5df]'
            } ${!mediaUrl && !uploading ? 'cursor-pointer hover:bg-[#ebedd1]' : ''}`}
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                  UPLOADING GRITTY DETAILS...
                </span>
              </div>
            ) : mediaUrl ? (
              // Preview Mode
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative border-4 border-black max-w-md w-full bg-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt="Ride Preview"
                      className="w-full max-h-64 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-64 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaUrl('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-mono font-black text-xs px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    REMOVE
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onButtonClick();
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95"
                  >
                    REPLACE FILE
                  </button>
                </div>
              </div>
            ) : (
              // Empty/Input Mode
              <>
                <span className="material-symbols-outlined text-[64px] text-black mb-2 select-none">
                  add_photo_alternate
                </span>
                <span className="font-display text-lg font-black uppercase tracking-tight text-black">
                  DRAG & DROP PHOTO/VIDEO
                </span>
                <span className="font-body text-[11px] text-gray-600 max-w-sm mt-1 leading-relaxed">
                  Drop your raw ride media here, or <span className="underline font-bold text-black">click to browse</span>. Show the mud.
                </span>

                {/* Media Type Toggle */}
                <div className="flex gap-4 mt-4 mb-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 ${
                      mediaType === 'image' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    📷 PHOTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 ${
                      mediaType === 'video' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    🎥 VIDEO
                  </button>
                </div>
              </>
            )}

            {/* Paste Media URL Input */}
            <div className="w-11/12 max-w-md mx-auto mt-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest mb-1.5 text-center">
                — OR PASTE MEDIA URL —
              </div>
              <input
                type="text"
                placeholder="PASTE PHOTO/VIDEO URL HERE..."
                className="w-full border-4 border-black p-3 font-mono text-xs text-center focus:bg-white bg-[#e2e4cf]/80 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 outline-none transition-all placeholder:text-gray-500 font-bold"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                required={!mediaUrl}
              />
            </div>
          </div>

          {/* Caption / Story */}
          <div className="flex flex-col">
            <label className="bg-[#ffb5a0] text-black border-2 border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 w-fit -mb-1 ml-4 relative z-10 block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              STORY
            </label>
            <textarea
              placeholder="HOW WAS THE SUFFERFEST?"
              rows={6}
              className="w-full bg-white border-4 border-black p-4 font-body text-body-md placeholder:text-gray-400 focus:bg-[#f4f5df] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none resize-none"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              required
            />
          </div>

          {/* Location Input */}
          <div className="flex flex-col">
            <label className="bg-[#caf300] text-black border-2 border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 w-fit -mb-1 ml-4 relative z-10 block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              LOCATION
            </label>
            <input
              type="text"
              placeholder="WHERE DID YOU RIDE? (E.G. SENTUL, JAKARTA)"
              className="w-full bg-white border-4 border-black p-4 font-mono text-xs font-bold placeholder:text-gray-400 focus:bg-[#f4f5df] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Tags Input */}
          <div className="flex flex-col">
            <label className="bg-[#ffd000] text-black border-2 border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 w-fit -mb-1 ml-4 relative z-10 block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              placeholder="MTB, GRAVEL, ROAD, MORNING RUN..."
              className="w-full bg-white border-4 border-black p-4 font-mono text-xs font-bold placeholder:text-gray-400 focus:bg-[#f4f5df] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Right Column: Ride Stats & Submit */}
        <div className="lg:col-span-1 flex flex-col justify-between h-full space-y-6">
          {/* Stats Box */}
          <div className="bg-white border-4 border-black p-6 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5">
            <div className="absolute -top-3 right-4 bg-black text-white font-mono text-[10px] font-black uppercase px-3 py-1 border-2 border-black rotate-6 z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              RIDE STATS
            </div>

            {/* Distance Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Distance (KM)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 material-symbols-outlined text-gray-500">route</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="00.0"
                  className="w-full pl-12 pr-4 py-3 border-4 border-black bg-[#f4f5df] font-mono text-sm font-bold focus:bg-white transition-all outline-none"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Duration Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Duration (HH:MM)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 material-symbols-outlined text-gray-500">timer</span>
                <input
                  type="text"
                  placeholder="00:00"
                  className="w-full pl-12 pr-4 py-3 border-4 border-black bg-[#f4f5df] font-mono text-sm font-bold focus:bg-white transition-all outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Elevation Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Elevation (M)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 material-symbols-outlined text-gray-500">landscape</span>
                <input
                  type="number"
                  placeholder="0000"
                  className="w-full pl-12 pr-4 py-3 border-4 border-black bg-[#f4f5df] font-mono text-sm font-bold focus:bg-white transition-all outline-none"
                  value={elevation}
                  onChange={(e) => setElevation(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#caf300] hover:bg-[#caf300]/95 text-black border-4 border-black px-6 py-4 font-display text-md sm:text-xl font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[0px] active:translate-y-[0px] active:shadow-none flex items-center justify-center gap-2"
          >
            {submitting ? 'POSTING...' : 'POST TO FEED'}
            <span className="material-symbols-outlined font-black text-xl">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}


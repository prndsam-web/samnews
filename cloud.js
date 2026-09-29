// آپلود به Cloudinary
const CLOUDINARY_CLOUD = "sgr2wj37";
const CLOUDINARY_PRESET = "samnews_uploads";

window.uploadToCloudinary = async function(file, onProgress){
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if(e.lengthComputable && onProgress){
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if(xhr.status === 200){
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url);
        } catch(err){ reject(new Error("پاسخ نامعتبر")); }
      } else {
        reject(new Error("خطا: " + xhr.status));
      }
    };
    xhr.onerror = () => reject(new Error("خطای شبکه"));
    xhr.send(formData);
  });
};

// انتخاب فایل و آپلود
window.pickAndUpload = function(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = async () => {
    const file = input.files[0];
    if(!file) return;

    if(file.size > 100 * 1024 * 1024){
      if(window.showToast) window.showToast("❌ حجم فایل بیش از ۱۰۰ مگابایت");
      return;
    }

    const status = document.getElementById("uploadStatus");
    const preview = document.getElementById("uploadPreview");
    if(status) status.textContent = "⏳ در حال آپلود… ۰٪";
    if(preview) preview.innerHTML = "";

    try {
      const url = await window.uploadToCloudinary(file, (p) => {
        if(status) status.textContent = `⏳ در حال آپلود… ${p}٪`;
      });

      // ذخیره در فیلد مخفی
      const videoInput = document.getElementById("newsVideo");
      if(videoInput) videoInput.value = url;

      // پیش‌نمایش
      if(preview){
        if(file.type.startsWith("video/")){
          preview.innerHTML = `<video src="${url}" controls style="width:100%;border-radius:10px;margin-top:8px;max-height:200px;"></video>`;
        } else {
          preview.innerHTML = `<img src="${url}" style="width:100%;border-radius:10px;margin-top:8px;max-height:200px;object-fit:cover;" />`;
        }
      }
      if(status) status.textContent = "✅ آپلود شد";
      if(window.showToast) window.showToast("✅ آپلود موفق");
    } catch(err){
      console.error(err);
      if(status) status.textContent = "❌ خطا در آپلود";
      if(window.showToast) window.showToast("❌ خطا در آپلود");
    }
  };
  input.click();
};

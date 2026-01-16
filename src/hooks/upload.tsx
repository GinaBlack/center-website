const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  await fetch("/api/upload-print-file", {
    method: "POST",
    body: formData,
  });
};

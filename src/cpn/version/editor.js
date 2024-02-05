import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';

// Đăng ký module imageResize với Quill
Quill.register('modules/imageResize', ImageResize);

const Editor = ({ versionDescription, setUpdateVersion }) => {
  // Cấu hình modules cho ReactQuill
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
    ],
    clipboard: {
      matchVisual: false,
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize'],
    }
  };

  return (
    <ReactQuill
      theme="snow"
      value={versionDescription}
      onChange={(content) => {
        setUpdateVersion(prevVersion => ({
          ...prevVersion,
          version_description: content
        }));
      }}
      modules={modules}
      placeholder={"Write something..."}
    />
  );
};

export default Editor;

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
export default (props) => {

    const { proxy, pages, lang, functions } = useSelector(state => state);
    const [current, setCurrent] = useState([]);
    const [imageError, setImageError] = useState(false);

    const { field, changeTrigger, defaultValue } = props;
    console.log(16, props)

    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
        changeTrigger(field, value);
    };

    useEffect(() => {
        setCurrent(defaultValue);
    }, [defaultValue]);

    const acceptTypes = field.FILE_ACCEPT_TYPES.map(type => `.${type}`).join(',');

    console.log(current)

    const handleAttachMedia = (e) => {
        console.log(e)
        if (!field.FILE_MULTIPLE && current && current.length > 0) {
            return;
        }
        const newFiles = Array.from(e.target.files).filter(file => {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                return true;
            } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
                return true;
            } else if (file.type.includes('excel') || fileExtension === 'xls' || fileExtension === 'xlsx') {
                return true;
            } else if (fileExtension === 'zip') {
                return true;
            }
            // Thêm điều kiện cho file Word
            else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === 'docx' || file.type === 'application/msword' || fileExtension === 'doc') {
                return true;
            }
            return false;
        });
        console.log(830, newFiles)

        if (newFiles.length < e.target.files.length) {
            // e.target.value = '';
            return;
        }

        const newMediaPromises = newFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();

                reader.onload = (readerEvent) => {
                    // Xác định fileType dựa trên MIME type hoặc phần mở rộng của file
                    let fileType;
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    // Thêm điều kiện cho file Word
                    if (file.type.startsWith('video/')) {
                        fileType = 'video';
                    } else if (file.type.startsWith('image/')) {
                        fileType = 'image';
                    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        fileType = 'word'; // Đánh dấu fileType là 'word' cho docx
                    } else if (file.type === 'application/msword') {
                        fileType = 'word'; // Đánh dấu fileType là 'word' cho doc
                    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                        fileType = 'excel';
                    } else if (fileExtension === 'pdf') {
                        fileType = 'pdf';
                    } else if (fileExtension === 'zip') {
                        fileType = 'zip';
                    } else {
                        fileType = 'unknown'; // Hoặc một giá trị mặc định khác
                    }

                    const mediaObject = {
                        name: file.name,
                        size: file.size,
                        url: URL.createObjectURL(file),
                        type: fileType,
                        dataUrl: readerEvent.target.result, // Chuỗi base64
                    };

                    resolve(mediaObject);
                };

                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    reader.readAsDataURL(file);
                } else {
                    // Đọc file PDF và Excel dưới dạng base64
                    reader.readAsDataURL(file);
                }
            });
        });

        Promise.all(newMediaPromises).then(newMediaFiles => {

            setCurrent(prevImages => Array.isArray(prevImages) ? [...prevImages, ...newMediaFiles] : [...newMediaFiles]);

        });
        e.target.value = '';
    };

    useEffect(() => {
        if (current !== undefined) { // Kiểm tra để đảm bảo `current` không phải là `undefined`
            const dataImg = current?.map(item => (
                {
                    "filename": item.name,
                    "base64": item.dataUrl ? item.dataUrl.split('base64,').pop() : null
                })
            );
            changeTrigger(field, dataImg);
        }
    }, [current]); // Theo dõi sự thay đổi của `current`

    const removeAttachMedia = (e, media) => {
        e.stopPropagation();
        e.preventDefault();
        const updatedMediaList = current?.filter(item => item.url !== media.url);
        setCurrent(updatedMediaList)
    };

    return (
        <div class="row justify-content-center ">

            <div class="col-md-6  mb-1">

                {/* <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                        <input
                            type="file"
                            // value={dataImg}
                            onChange={handleAttachMedia}
                            className={`form-control`}
                            accept={acceptTypes}
                            multiple={field.FILE_MULTIPLE ? true : false}
                        />
                    </div> */}
                <div class="form-group">
                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                    <div className="custom-file">
                        <input
                            type="file"
                            id="customFile"
                            className="custom-file-input"
                            accept={acceptTypes}
                            multiple={field.FILE_MULTIPLE ? true : false}
                            onChange={handleAttachMedia}
                        />
                        <label className="custom-file-label" htmlFor="customFile">
                            Choose file
                        </label>
                    </div>
                </div>

                {current && current.length > 0 &&
                    <div className={`selected-images-container-add`} >
                        {current?.map((media, index) => (
                            <div key={index} className="selected-image-wrapper-add">

                                {media.type === 'image' && (
                                    <img src={media.url} alt={`Selected ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" title={media.name}/*onClick={() => openModalPreview(media)}*/ />
                                )}
                                {media.type === 'video' && (
                                    <div>
                                        <img src={media.cover} alt={`Cover for ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" title={media.name}/*onClick={() => openModalPreview(media)}*/ />
                                   
                                        <div class="video-duration">Video</div>
                                    </div>
                                )}
                                {media.type === 'pdf' && (
                                    <img src={"/images/icon/pdf.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                )}
                                {media.type === 'excel'&& (
                                    <img src={"/images/icon/excel.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                )}
                                {media.type === 'word' && (
                                    <img src={"/images/icon/docs.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                )}
                                {media.type === 'zip' && (
                                    <img src={"/images/icon/zip.png"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                )}
                                <button onClick={(e) => removeAttachMedia(e, media)} className="remove-image" title={lang["delete image"]}>X</button>
                            </div>
                        ))}

                       
                    </div>
                }
            </div>
        </div>
    );
};

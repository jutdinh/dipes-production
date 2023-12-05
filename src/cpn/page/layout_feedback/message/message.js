import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';

const MessageItem = ({ item, username, showFullMessage, toggleShowFullMessage, handleContextMenu, openModalPreview, lang, serverImage }) => {
    const words = (item["1MC"] || "").split(' ');
    const shouldTruncate = words.length > 50 && !showFullMessage[item["1MI"]];
    const truncatedText = words.slice(0, 50).join(' ');
    const isSentByUser = item["1PB"] === username;

    return (
        <div
            className={`message-container ${isSentByUser ? "sent" : "received"}`}
            onContextMenu={(event) => {
                if (isSentByUser) {
                    handleContextMenu(event, item);
                }
            }}
        >
            <span className="message-image-user">{item["1PB"] || "Unknown"}</span>
            <p>
                {shouldTruncate ? (
                    <>
                        {truncatedText}
                        <a onClick={() => toggleShowFullMessage(item["1MI"])} className="font-weight-bold pointer">... {lang["Show more"]}</a>
                    </>
                ) : (
                    item["1MC"]
                )}
            </p>
            {item.media && (
                <div className="media-container">
                    {item.media.map(media => (
                        media["9MT"] === "image" ? (
                            <img className="message-image pointer" src={serverImage + media["5U"]}
                                data-toggle="modal" data-target="#previewMedia"
                                onClick={() => openModalPreview({ type: "imageMessageMedia", url: serverImage + media["5U"] })}
                                alt="Media content"
                                title="Click to preview" />
                        ) : (
                            <div className="video-container">
                                <video className="message-image pointer" controls={false} src={serverImage + media["5U"]} type="video/mp4">
                                </video>

                                <div className="video-overlay pointer" data-toggle="modal" data-target="#previewMedia"
                                    onClick={() => openModalPreview({ type: "videoMessageMedia", url: serverImage + media["5U"] })}
                                    title="Click to preview"></div>
                                <div className="video-icon play-icon">
                                    <FontAwesomeIcon icon={faCirclePlay} className="size-16  color_icon_plus" />
                                </div>

                            </div>
                        )
                    ))}
                </div>
            )}
            <div className="message-timestamp"> {item["1PA"]} </div>
        </div>
    );
};

export default MessageItem;

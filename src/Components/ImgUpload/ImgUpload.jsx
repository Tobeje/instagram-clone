import React, { useState } from 'react';
import { TextField, Button, LinearProgress } from '@material-ui/core';
import styles from './ImgUpload.module.css';
import { storage, db } from '../../api/firebase';
import { firestore } from 'firebase/app';

function ImgUpload({ username }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.log(error);
        alert('Error on Upload');
      },
      () => {
        storage
          .ref('images')
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            db.collection('posts').add({
              timestamp: firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              username: username,
            });
            setProgress(0);
            setCaption('');
            setImage(null);
          });
      }
    );
  };

  return (
    <div className={styles.imageupload}>
      <LinearProgress variant="determinate" value={progress} />
      <TextField
        label="Enter a caption..."
        margin="dense"
        type="text"
        variant="outlined"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      <input type="file" onChange={handleChange} />
      <Button
        disabled={!image}
        className={styles.imageupload__button}
        onClick={handleUpload}
      >
        Upload
      </Button>
    </div>
  );
}

export default ImgUpload;

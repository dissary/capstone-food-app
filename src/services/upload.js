import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadImage(file, folder) {
  const fileName = `${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
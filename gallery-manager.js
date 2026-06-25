import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

import {
    auth,
    db,
    storage,
    ADMIN_UID
} from "./firebase-config.js";

const gallery = document.querySelector("[data-gallery-page]");
const form = document.querySelector("#photo-upload-form");
const fileInput = document.querySelector("#photo-file");
const titleInput = document.querySelector("#photo-title");
const submitButton = document.querySelector("#upload-submit");
const submitText = submitButton?.querySelector("span");
const message = document.querySelector("#upload-message");

const pageName = gallery?.dataset.galleryPage;

function showMessage(text, success = false) {
    if (!message) return;

    message.textContent = text;
    message.classList.toggle("is-success", success);
}

function setLoading(loading) {
    if (!submitButton || !submitText) return;

    submitButton.disabled = loading;
    submitText.textContent = loading
        ? "Otimizando e enviando..."
        : "Enviar fotografia";
}

function createPhotoItem(photo) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.dataset.photoId = photo.id;
    item.dataset.storagePath = photo.storagePath;

    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = photo.url;
    tile.dataset.full = photo.url;
    tile.dataset.alt = photo.titulo;

    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = photo.titulo;
    image.loading = "lazy";
    image.decoding = "async";

    const deleteButton = document.createElement("button");
    deleteButton.className = "photo-delete";
    deleteButton.type = "button";
    deleteButton.dataset.deletePhoto = "";
    deleteButton.title = "Excluir fotografia";
    deleteButton.setAttribute("aria-label", "Excluir fotografia");
    deleteButton.innerHTML =
        '<i data-lucide="trash-2" aria-hidden="true"></i>';

    tile.append(image);
    item.append(tile, deleteButton);

    return item;
}
async function loadFirebasePhotos() {
    if (!gallery || !pageName) return;

    const photosQuery = query(
        collection(db, "fotos"),
        where("pagina", "==", pageName)
    );

    const snapshot = await getDocs(photosQuery);

    const photos = snapshot.docs
        .map((document) => ({
            id: document.id,
            ...document.data()
        }))
        .sort((first, second) => first.ordem - second.ordem);

    photos.forEach((photo) => {
        gallery.append(createPhotoItem(photo));
    });

    window.lucide?.createIcons();
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("invalid-image"));
        };

        image.src = objectUrl;
    });
}

async function optimizeImage(file) {
    const image = await loadImage(file);
    const maximumDimension = 3200;
    const largestDimension = Math.max(
        image.naturalWidth,
        image.naturalHeight
    );

    const scale = Math.min(1, maximumDimension / largestDimension);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext("2d");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.9);
    });

    if (!blob || blob.size > 10 * 1024 * 1024) {
        throw new Error("optimized-image-too-large");
    }

    return blob;
}

gallery?.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-photo]");

    if (!deleteButton || !gallery.contains(deleteButton)) return;

    const item = deleteButton.closest(".gallery-item");
    const photoId = item?.dataset.photoId;
    const storagePath = item?.dataset.storagePath;
    const user = auth.currentUser;

    if (!user || user.uid !== ADMIN_UID) {
        showMessage("Sua sessão expirou. Entre novamente.");
        return;
    }

    if (!photoId || !storagePath) return;

    const confirmed = window.confirm(
        "Deseja realmente excluir esta fotografia?"
    );

    if (!confirmed) return;

    deleteButton.disabled = true;

    try {
        await deleteDoc(doc(db, "fotos", photoId));

        try {
            await deleteObject(ref(storage, storagePath));
        } catch (error) {
            console.error("Falha ao remover arquivo do Storage:", error);
        }

        item.remove();
        showMessage("Fotografia excluída com sucesso.", true);
    } catch (error) {
        console.error("Falha ao excluir fotografia:", error);
        showMessage("Não foi possível excluir a fotografia.");
        deleteButton.disabled = false;
    }
});

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");

    const file = fileInput.files[0];
    const title = titleInput.value.trim();
    const user = auth.currentUser;

    if (!user || user.uid !== ADMIN_UID) {
        showMessage("Sua sessão expirou. Entre novamente.");
        return;
    }

    if (!file || title.length < 3) {
        showMessage("Selecione uma fotografia e informe a descrição.");
        return;
    }

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        showMessage("Use uma imagem JPEG, PNG ou WebP.");
        return;
    }

    setLoading(true);

    let uploadedReference;

    try {
        const optimizedImage = await optimizeImage(file);
        const fileName = `${crypto.randomUUID()}.webp`;
        const storagePath = `galerias/${pageName}/${fileName}`;

        uploadedReference = ref(storage, storagePath);

        await uploadBytes(uploadedReference, optimizedImage, {
            contentType: "image/webp"
        });

        const url = await getDownloadURL(uploadedReference);

        const documentReference = await addDoc(collection(db, "fotos"), {
            pagina: pageName,
            titulo: title,
            url,
            storagePath,
            ordem: Date.now(),
            createdAt: serverTimestamp()
        });

        gallery.append(
            createPhotoItem({
                id: documentReference.id,
                titulo: title,
                url,
                storagePath
            })
        );

        window.lucide?.createIcons();

        form.reset();
        showMessage("Fotografia publicada com sucesso.", true);
    } catch (error) {
        if (uploadedReference) {
            try {
                await deleteObject(uploadedReference);
            } catch {
                // O arquivo pode já ter sido removido.
            }
        }

        console.error("Falha ao publicar fotografia:", error);
        showMessage("Não foi possível publicar a fotografia.");
    } finally {
        setLoading(false);
    }
});

loadFirebasePhotos().catch((error) => {
    console.error("Falha ao carregar fotografias:", error);
});
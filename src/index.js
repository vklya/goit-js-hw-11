import { Notify } from "notiflix";
import PixabayAPI from "./js/PixabayAPI";
import LoadMoreBtn from './js/load-more-btn';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    spinner: document.querySelector('.gallery__spinner'),
}

const api = new PixabayAPI();

const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more', hidden: true });
let lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

refs.form.addEventListener('submit', onSearch);
loadMoreBtn.btn.addEventListener('click', onLoadMore);
refs.spinner.classList.add('is-hidden');

function onSearch(e) {
    e.preventDefault();

    loadMoreBtn.hide();
    clearGallery();
    api.resetPage();
    api.query = e.currentTarget.elements.searchQuery.value.trim();
    if (api.query === '') {
        Notify.warning('Enter data to continue searching', { position: "center-top", timeout: 4000 });
        return;
    }
    refs.spinner.classList.remove('is-hidden');

    fetchGallery();
}

async function fetchGallery() {
    try {
        const images = await api.fetchImages();
        const countHits = images.data.hits.length;
        console.log(countHits);
        if (countHits === 0) {
            Notify.failure('Sorry, there are no images matching your search query. Please try again.', { position: "center-top", timeout: 4000 });
            refs.spinner.classList.add('is-hidden');
            return;
        }
        else {
            refs.spinner.classList.add('is-hidden');
            renderGallery(images.data.hits);
            if (countHits >= 40) {
                loadMoreBtn.show();
                if (api.page === 1)
                    Notify.success(`Hooray! We found ${images.data.totalHits} images.`, { position: "center-top", timeout: 4000 });
            }
            else if (countHits < 40) {
                loadMoreBtn.hide();
                Notify.warning("We're sorry, but you've reached the end of search results.", { position: "center-top", timeout: 4000 });
            }
        lightbox.refresh();
        }   
    }
    catch (error) {
        api.resetPage();
        refs.spinner.classList.add('is-hidden');
        Notify.failure('Ooops, ', error.message, { position: "center-top", timeout: 4000 });
    }
}

function renderGallery(hits) {
    const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads, }) => {
        return `<div class="gallery__card">
        <div class="gallery__item">
            <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" title="${tags}" loading="lazy" class="gallery__image"/></a>
        </div>
        <div class="info">
        <p class="info__item">
            <b>Likes</b>
                    <span>${likes}</span>
        </p>
        <p class="info__item">
            <b>Views</b>
                    <span>${views}</span>
        </p>
        <p class="info__item">
            <b>Comments</b>
                    <span>${comments}</span>
        </p>
        <p class="info__item">
            <b>Downloads</b>
                    <span>${downloads}</span>
        </p>
        </div>
    </div>`
    }).join('');

    refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function onLoadMore() {
    api.incrementPage();
    fetchGallery();
}

function clearGallery() {
    refs.gallery.innerHTML = '';
}

import SimpleLightbox from 'simplelightbox';
import { Notify } from "notiflix";
import { PixabayAPI } from "./js/PixabayAPI";
import { LoadMoreBtn } from './js/load-more-btn';

const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    spinner: document.querySelector('.gallery__spinner'),
}

const api = PixabayAPI;
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

    clearGallery();
    api.query = e.currentTarget.element.query.value.trim();
    if (api.query === '') {
        warning();
        return;
    }
    api.resetPage();
    refs.spinner.classList.remove('is-hidden');

    fetchGallery();
}

async function fetchGallery() {
    try {
        await api.fetchImages().then(data => {
            const countHits = data.hits.length;
            if (countHits === 0) {
                error();
                refs.spinner.classList.remove('is-hidden');
                return;
            }
            else {
                renderGallery(data.hits);
                success();
                if (countHits >= 40) {
                    loadMoreBtn.show();
                }
                else if (countHits < 40) {
                    loadMoreBtn.hide();
                    Notify.warning("We're sorry, but you've reached the end of search results.");
                }
            lightbox.refresh();
            }
        });
    } catch (error) {
        api.resetPage();
        refs.spinner.classList.remove('is-hidden');
        Notify.failure(error.message);
    }
}

function renderGallery(hits) {
    const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads, }) => {
        return `<a href="${largeImageURL}"><div class="gallery__item">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
        <p class="info-item">
            <b>Likes</b>
                    <span>${likes}</span>
        </p>
        <p class="info-item">
            <b>Views</b>
                    <span>${views}</span>
        </p>
        <p class="info-item">
            <b>Comments</b>
                    <span>${comments}</span>
        </p>
        <p class="info-item">
            <b>Downloads</b>
                    <span>${downloads}</span>
        </p>
        </div>
    </div></a>`
    }).join('');

    refs.gallery.insertAdjacentElement('beforeend', markup);
    smoothScroll();
}

function smoothScroll() {
    const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 8,
        behavior: 'smooth',
    });
}

function clearGallery() {
    refs.gallery.innerHTML = '';
}


function success() {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function error() {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function warning() {
    Notify.warning('Enter data to continue searching');
}
import axios from "axios";

const KEY = '32131047-140602d0b818ac999ff04a7d8';
const URL = 'https://pixabay.com/api/';

export default class PixabayAPI {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
    }

    async fetchImages() {
        const url = `${URL}?key=${KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`;
        const responce = await axios.get(url);

        return responce;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}
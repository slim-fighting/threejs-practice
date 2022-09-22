import axios from 'axios';
import { AudioTest } from './examples/audio'
import './style.css'

new AudioTest()
let songId: string = '';
axios.get(`http://localhost:3000/search`, { params: { keywords: '海阔天空' } }).then(res => {
    songId = res.data.result.songs[0].id
})

export const song = axios.get('http://localhost:3000/song/url', { params: {
    id: 347230
}})




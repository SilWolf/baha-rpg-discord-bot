import axios from 'axios'

const bahaToken = process.env.bahaToken

export const getPosts = () => axios.get('https://api.gamer.com.tw/guild/v1/post_list.php', {
  params: {
    gsn: 3014
  },
  headers: {
    Cookie: `BAHARUNE=${bahaToken};`
  }
}).then((res) => res.data)

export default {}
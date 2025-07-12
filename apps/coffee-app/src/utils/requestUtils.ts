import { resolve } from 'path'
import axios from '../helpers/axios'
import { rejects } from 'assert'

export const fetchDashboardSummary = async (config: any): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get('/api/dashboard/summary-list', config)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}
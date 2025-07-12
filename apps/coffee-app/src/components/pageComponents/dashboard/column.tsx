export const Columns = (): any[] => {
    return [
        {
            label: 'Date',
            key: 'date',
            width: '30%',
        },
        {
            label: 'TotalSale',
            key: 'totalSales',
            width: '20%',
        },
        {
            label: 'Order',
            key: 'order',
            width: '35%',
            dataMutation: (row:any) => `${row.shift} (${row.staffCount} person)`
        },
        {
            label: 'Shift',
            key: 'shift',
            width: '30%',
        },
        {
            label: 'Best Seller Menu',
            key: 'bestSeller',
            width: '30%',
        },
         {
            label: 'Notifications',
            key: 'notifications',
            width: '30%',
        },
         {
            label: 'View Details',
            key: 'viewDetails',
            width: '30%',
        },



    ]
}
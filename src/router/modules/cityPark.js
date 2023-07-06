const cityParkRoutes = [
    {
        path: '/cityPark',
        name: 'cityPark',
        component: () => import(/* webpackChunkName: "cityPark" */ '../../views/cityPark/index'),
        meta: { title: '智慧城市' }
    },
]

export default cityParkRoutes;
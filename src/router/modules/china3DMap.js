const china3DMap = [
    {
        path: '/china3DMap',
        name: 'china3DMap',
        component: () => import(/* webpackChunkName: "cityPark" */ '../../views/china3DMap/index'),
        meta: { title: '3D地图' }
    },
]

export default china3DMap;
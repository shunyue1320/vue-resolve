import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
  input: './src/index.js',        //打包入口
  output: {                       //出口
    format: 'umd',
    file: 'dist/vue.js',
    name: 'Vue',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'ndoe_modules/**'  //排除
    }),
    process.env.ENV === 'development' ? serve({                       //开启服务
      open: true,
      openPage: '/public/index.html',
      port: 3000,
      contentBase: ''
    }) : null
  ]
}
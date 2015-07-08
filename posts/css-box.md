开启盒子模型：`display: box;`

盒子中通过`box-flex:1`设置占比，盒子中的多个块元素将按占比划分。

若盒子中块元素设置了`margin`或`width`，将减去这些长度后按占比划分。

`box-orient`可以设置盒子的排列方式，主要是水平`horizontal`和垂直`vertical`。

`box-direction`可以设置盒子的排列方向，主要是正向`normal`和反向`reverse`。

`box-align`设置垂直方向的对齐方式，`start`为居顶对齐，`end`居底对齐,`center`为剧中对齐,`stretch`为拉伸至与父容器等高。

`box-pack`设置水平方向的对齐方式，`start`为水平居左对齐,`end`为水平居右对齐，`center`为水平居中对齐，`justify`为水平等分父容器宽度。
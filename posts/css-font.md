字体样式：

1、使用自定义字体：

		@font-face{
			font-family: keller;
			src: url('wanzi.ttf');
			url('wanzi.ttf') /* ie9+ */
		}
		span{
			font-family: keller;
			font-size: 20px;
		}
		
2、首字符缩进和文本下沉
对span不起作用,float起下沉的作用

		p{
			text-indent: 15px;
		}
		p:first-letter{
			font-size: 25px;
			color: red;
			float: left;
		}
	
3、选中字符的样式

		::selection{
			color: #9400d3;
			background-color: #a9a9a9;
		}
		/* firefox */
		::-moz-selection{
			color: #9400d3;
			background-color: #a9a9a9;
		}
		
4、文字间距

		p{
			word-spacing: 20px;/*空格长度*/
			letter-spacing: 20px;/*字符间距*/
			line-height: 20px;/*行间距*/
		}
		
5、文本溢出

		div{
			text-overflow:ellipsis;/*省略号替换*/
			text-overflow:clip;/*修剪文本*/
		}
		
6、文字毛玻璃效果

毛玻璃效果是使用文字阴影和字体透明效果实现的

box-shadow设置了边框阴影；color设置了透明度使得文字为不可见状态，只留下文本阴影效果
	
        p{
            box-shadow: 1px 1px 2px 2px #ccc;
            color: rgba(0,0,0,0);
            text-shadow: 5px 5px 5px #6600ff;
        }
        
边框样式：

1、圆角属性：

依据顺序是top-left,top-right,bottom-right,bottom-left，/号前表示横向半径，/后表示纵向半径。

        div{
            width: 100px;
            height: 100px;
            border: 1px solid black;
            border-radius: 5px 6px 8px 10px/5px 6px 8px 10px;
        }
最开始接触git的时候，使用的git分支模型就是github默认支持的github flow。

后来在新公司基于业务需要，设计了一套适合业务版本发布的git流程，用得也挺顺手。

而最近又接触了gitflow，发现也有合理的地方。

总的看下来，他们都有各自适合的场景，既有优势也有缺点，所以总结对比一下。

## 1、github flow

![post](../img/git-github-flow.png)

最简单的模型，就是github flow。

github flow只包含master分支和特性分支，所有其他特性分支通过pull request对master进行合并。

对于github flow，只有master一个分支用于测试和发布，并且测试的都是即将发布的提交。

### 总结：

github flow的特点就是多次快速发布。对于需要经常短期多次发布的业务，加上自动化测试和自动化发布，效率会非常高。

---

## 2、gitflow

![post](../img/git-gitflow.png)

git flow相对复杂：

dev分支是主分支，反映了最新的需要发布的修改；

feature分支从dev分支切出，用于开发新特性，开发完后并且确认需要发布，可以合并回dev；

合并回dev后，可以切出release分支进行测试和特性修复，这里不建议做大的特性修改（大的修改应在前期feature测试充分再合并到dev），release测试通过后可以合并回dev，并合并到master进行发布；

合并后的master分支可以进行回归测试，如果master有需要修改的bug，可以切出hotfix分支进行修复，修复完hotfix要合并到dev和master；

整个过程中，固有的分支只有dev和master分支，特性开发围绕dev展开，bug修复围绕master展开；

而需要测试的分支包括release分支和master分支，master分支用作最后的回归测试。

优点：

gitflow保证了dev分支的稳定性，要求合并到dev分支的代码必须是可测试的，保证了后续切出的feature分支是在稳定的代码上开发的（虽然不一定是最终的代码）；

缺点：

测试的过程中，需要切换不同的release分支进行测试。

### 总结：

总的来说，按照gitflow的流程进行的开发，基本是不存在版本混乱的问题的。

---

## 3、自定义flow

![post](../img/git-my-gitflow.jpeg)

分析了git flow之后回过头来看看曾经我们自己设计的git流程（我画了张简图）。

我们设计了四个分支类型，其中master分支用于发布；

feature分支从master切出，用于特性开发；

feature分支开发完成后，合并到dev进行测试；

测试通过后，feature分支再合并到pr分支，进行回归测试；

回归测试通过后，pr分支合并到master分支进行发布，删除feature分支；

如果线上master出现了bug，直接从master切出hotfix分支，修复完成后合并dev、pr，并在pr上测试。

优点：

测试分支固定，不需要切换。

缺点：

对比gitflow可以看出pr分支是多余的，完全可以用master代替，版本出现问题使用回滚即可；

dev分支不稳定，多个feature分支都可随时合并到dev，dev测试通过的版本跟最终回归测试的版本不一定相同，这会导致bug在不同的分支不能复现的问题。

### 总结：

这个流程的设计明显是有问题的，在参与人数较少的情况下尚可使用，但是当参与人数多的时候，就可能会引起版本混乱。
# coin-tool

一个数字货币多钱包管理和智能合约工具

- 钱包
    - HD 钱包（基于助记词）
        - 批量增加账户
        - 使用助记词导入 HD 钱包
    - simple 钱包（基于私钥）
        - 添加钱包地址（无需密钥，主要用于查看）
        - 使用私钥添加钱包
    - 代币导入
    - 网络
        - 主网
        - 测试网
- 工具
    - 智能合约
        - ABI 调试
        - 智能合约管理
    - 转账
        - 一对多
        - 多对一

## 开发说明

当前主要用到的技术栈如下

- vue3
- naive-ui
- typescript
- pinia
- ethers.js 为避免安全问题，web3 相关的依赖非必要不再引入
- pnpm 依赖管理

### 存储

- wallet
  - address
  - group
- chain
  - network
  - token
  - contract
  - transaction
- key
  - hd
  - private key

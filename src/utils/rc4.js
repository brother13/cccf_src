class RC4 {
  /**
     * 初始化 RC4 密钥调度算法 (KSA)
     * @param {string|Uint8Array} key - 密钥（字符串或字节数组）
     * @returns {Uint8Array} 初始化后的 S-Box
     */
  static initSBox(key) {
    const keyBytes = typeof key === 'string'
      ? new TextEncoder().encode(key)
      : key
    const sbox = new Uint8Array(256)

    // 初始化 S-Box
    for (let i = 0; i < 256; i++) {
      sbox[i] = i
    }

    // 使用密钥打乱 S-Box
    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + sbox[i] + keyBytes[i % keyBytes.length]) % 256;
      // 交换 sbox[i] 和 sbox[j]
      [sbox[i], sbox[j]] = [sbox[j], sbox[i]]
    }

    return sbox
  }

  /**
     * RC4 加密/解密处理
     * @param {Uint8Array} sbox - 初始化后的 S-Box
     * @param {Uint8Array} data - 输入数据（明文或密文）
     * @returns {Uint8Array} 处理后的数据
     */
  static process(sbox, data) {
    const output = new Uint8Array(data.length)
    let i = 0
    let j = 0

    for (let k = 0; k < data.length; k++) {
      i = (i + 1) % 256
      j = (j + sbox[i]) % 256;

      // 交换 sbox[i] 和 sbox[j]
      [sbox[i], sbox[j]] = [sbox[j], sbox[i]]

      // 生成密钥流字节
      const t = (sbox[i] + sbox[j]) % 256
      const keyByte = sbox[t]

      // 异或运算（加密/解密）
      output[k] = data[k] ^ keyByte
    }

    return output
  }

  /**
     * 加密/解密主函数
     * @param {string|Uint8Array} key - 密钥
     * @param {string|Uint8Array} input - 输入数据
     * @param {boolean} [isString=true] - 是否返回字符串
     * @returns {string|Uint8Array} 处理结果
     */
  static crypt(key, input, isString = true) {
    // 处理输入数据
    const inputBytes = typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input

    // 初始化 S-Box
    const sbox = this.initSBox(key)

    // 处理数据（加密/解密）
    const outputBytes = this.process(sbox, inputBytes)

    // 返回结果
    return isString
      ? new TextDecoder().decode(outputBytes)
      : outputBytes
  }
}

//   // 使用示例 --------------------------
//   const key = "SecretKey";
//   const plaintext = "Hello, RC4! 你好，RC4！";

//   // 加密
//   const encrypted = RC4.crypt(key, plaintext);
//   console.log("加密结果:", encrypted);

//   // 解密
//   const decrypted = RC4.crypt(key, encrypted);
//   console.log("解密结果:", decrypted);

//   // 验证加解密一致性
//   console.log("解密是否成功:", decrypted === plaintext);

export default RC4

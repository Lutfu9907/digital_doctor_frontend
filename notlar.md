frontend

- (Mailgun,Mailreset,Mailersend)(şifre resetleme)
- şu meta işine bir daha bak home sayfasına direkt gidiyor.(bu kısıma tekrardan bakacaksın)

- auth ve unatuh olacak 2 tane requst atacan fonk yaz. veya tenk fonk içinde if else ilede veya başka yöntemlerle yapılabilir.
- be de yazılan auth middlewaresinde eğer jwt geçersiz ise tek bir hata dön.
  fe de önceki maddeye istinaden yazılan auth req fonksiyonunda bu hata cevap olarak alınırsa
  localstorageyi temizle ve login sayfasına at kullanıcıyı.

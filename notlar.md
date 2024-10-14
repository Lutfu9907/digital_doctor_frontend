frontend

- (Mailgun,Mailreset,Mailersend)(şifre resetleme)
- şu meta işine bir daha bak home sayfasına direkt gidiyor.(bu kısıma tekrardan bakacaksın)

- auth ve unatuh olacak 2 tane request atacağın fonk yaz. veya tek fonk içinde if else ile de veya başka yöntemlerle yapılabilir.
- backend de yazılan auth middlewaresinde eğer jwt geçersiz ise tek bir hata dön.
  frontend de önceki maddeye istinaden yazılan auth req fonksiyonunda bu hata cevap olarak alınırsa
  localstorageyi temizle ve login sayfasına at kullanıcıyı.

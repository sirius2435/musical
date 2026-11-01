package services.user.utils
import cats.effect.IO
import java.security.{MessageDigest,SecureRandom}
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
object Passwords:
  private[user] def random: IO[String] = IO.blocking {val bytes = new Array[Byte](32);new SecureRandom().nextBytes(bytes);java.util.HexFormat.of().formatHex(bytes)}
  private[user] def hash(password: String,salt: String): IO[String] = IO.blocking {val spec = new PBEKeySpec(password.toCharArray,java.util.HexFormat.of().parseHex(salt),210000,256);java.util.HexFormat.of().formatHex(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded)}
  private[user] def tokenHash(token: String): String = java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)))

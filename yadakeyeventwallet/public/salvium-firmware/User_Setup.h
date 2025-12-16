// ESP32-2432S028 (Cheap Yellow Display) TFT Configuration
// 2.8" ILI9341 320x240 TFT with resistive touch

#define ILI9341_DRIVER
#define TFT_WIDTH  240
#define TFT_HEIGHT 320

// ESP32-2432S028 pin configuration
#define TFT_MISO 12
#define TFT_MOSI 13
#define TFT_SCLK 14
#define TFT_CS   15
#define TFT_DC   2
#define TFT_RST  -1  // Connected to 3.3V

// Backlight control
#define TFT_BL   21
#define TFT_BACKLIGHT_ON HIGH

// Use HSPI
#define TFT_SPI_PORT HSPI_HOST

// Touch screen pins (XPT2046 resistive touch)
#define TOUCH_CS 33

// Fonts
#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4
#define LOAD_FONT6
#define LOAD_FONT7
#define LOAD_FONT8
#define LOAD_GFXFF

#define SMOOTH_FONT

// SPI frequency
#define SPI_FREQUENCY  40000000
#define SPI_READ_FREQUENCY  20000000

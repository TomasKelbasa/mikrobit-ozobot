pins.set_pull(DigitalPin.P13, PinPullMode.PULL_NONE)
pins.set_pull(DigitalPin.P14, PinPullMode.PULL_NONE)

colors = {
    "red": [20, 350],
    "yellow": [70, 80],
    "green": [120, 140],
    "blue": [210, 225]
}
hysteresis = 10

def track_line(white_line = False):
    left_tracking = pins.digital_read_pin(DigitalPin.P13);
    right_tracking = pins.digital_read_pin(DigitalPin.P14);
    if left_tracking == 0 and right_tracking == 0:
        return 3 if white_line else 0
    elif left_tracking == 1 and right_tracking == 0:
        return 2 if white_line else 1
    elif left_tracking == 0 and right_tracking == 1:
        return 1 if white_line else 2
    elif left_tracking == 1 and right_tracking == 1:
        return 0 if white_line else 3
    else:
        return -1;

def on_forever():
    console.log_value("line", track_line(False))
    console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    console.log_value("hue",PlanetX_RGBsensor.read_color())
    console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    basic.pause(200)
basic.forever(on_forever)

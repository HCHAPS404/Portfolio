"""
Pipeline Blender (headless): construye una pieza procedural, la exporta a GLB
y renderiza una imagen de revisión.

Uso (desde la raíz del proyecto):
  blender -b --factory-startup -P tools/blender/build_piece.py -- --name torus --out-glb assets/3d/torus.glb --out-png renders/blender/torus.png

Argumentos después de "--":
  --name     nombre de la pieza (solo informativo)
  --out-glb  ruta del GLB de salida
  --out-png  ruta del render de revisión
  --res      resolución cuadrada del render (por defecto 1024)
  --samples  muestras de Cycles (por defecto 64; bajar para pruebas rápidas)
"""
import math
import os
import sys

import bpy


def arg(name, default=None):
    if "--" not in sys.argv:
        return default
    argv = sys.argv[sys.argv.index("--") + 1:]
    if name in argv:
        i = argv.index(name)
        if i + 1 < len(argv):
            return argv[i + 1]
    return default


OUT_GLB = arg("--out-glb", "assets/3d/torus.glb")
OUT_PNG = arg("--out-png", "renders/blender/torus.png")
RES = int(arg("--res", "1024"))
SAMPLES = int(arg("--samples", "64"))


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material():
    mat = bpy.data.materials.new(name="Ink")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    # Blanco hueso sobre negro: el estilo base de la paleta del sitio
    bsdf.inputs["Base Color"].default_value = (0.93, 0.92, 0.90, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.35
    return mat


def build_torus():
    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.38,
                                     major_segments=160, minor_segments=48,
                                     location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = "Torus"
    obj.rotation_euler = (math.radians(70), 0, math.radians(20))
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(make_material())
    return obj


def add_world_black():
    world = bpy.data.worlds.new("Void")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.02, 0.02, 0.025, 1.0)
    bg.inputs["Strength"].default_value = 1.0
    bpy.context.scene.world = world


def add_lights():
    key = bpy.data.lights.new(name="Key", type="AREA")
    key.energy = 900
    key.size = 4
    key_obj = bpy.data.objects.new("Key", key)
    key_obj.location = (3, -3, 4)
    bpy.context.collection.objects.link(key_obj)

    rim = bpy.data.lights.new(name="Rim", type="AREA")
    rim.energy = 400
    rim.size = 3
    rim.color = (1.0, 0.2, 0.22)  # acento rojo de la paleta
    rim_obj = bpy.data.objects.new("Rim", rim)
    rim_obj.location = (-3, 3, 2)
    bpy.context.collection.objects.link(rim_obj)


def add_camera(target):
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = (0, -5.5, 1.8)
    bpy.context.collection.objects.link(cam)
    track = cam.constraints.new(type="TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    bpy.context.scene.camera = cam


def configure_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x = RES
    scene.render.resolution_y = RES
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False


def export_glb():
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", use_selection=False)


def render_png():
    os.makedirs(os.path.dirname(OUT_PNG), exist_ok=True)
    bpy.context.scene.render.filepath = os.path.abspath(OUT_PNG)
    bpy.ops.render.render(write_still=True)


def main():
    clear_scene()
    add_world_black()
    obj = build_torus()
    add_lights()
    add_camera(obj)
    configure_render()
    export_glb()
    render_png()
    print(f"[ok] GLB: {OUT_GLB}")
    print(f"[ok] PNG: {OUT_PNG}")


if __name__ == "__main__":
    main()

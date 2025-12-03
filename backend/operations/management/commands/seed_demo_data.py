from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone

from products.models import Category, Warehouse, Product, StockItem, Supplier, UnitOfMeasure
from operations.models import Receipt, ReceiptItem, DeliveryOrder, DeliveryItem, InternalTransfer, TransferItem, StockAdjustment, AdjustmentItem


class Command(BaseCommand):
    help = "Seed demo data for StockMaster (users, master data, stock levels, and a few operations)"

    def handle(self, *args, **options):
        User = get_user_model()

        # 1) Demo user
        demo_user, created = User.objects.get_or_create(
            email="demo@stockmaster.com",
            defaults={
                "username": "demo",
                "role": "inventory_manager",
            },
        )
        if created or not demo_user.has_usable_password():
            demo_user.set_password("Demo1234!")
            demo_user.is_staff = True
            demo_user.is_superuser = True
            demo_user.save()
        self.stdout.write(self.style.SUCCESS("Created/updated demo user demo@stockmaster.com / Demo1234!"))

        # 2) Categories
        electronics, _ = Category.objects.get_or_create(
            name="Electronics",
            defaults={"description": "Electronic finished goods"},
        )
        raw, _ = Category.objects.get_or_create(
            name="Raw Materials",
            defaults={"description": "Raw materials"},
        )
        spares, _ = Category.objects.get_or_create(
            name="Spare Parts",
            defaults={"description": "Maintenance and critical spare parts"},
        )
        packaging, _ = Category.objects.get_or_create(
            name="Packaging Supplies",
            defaults={"description": "Cartons, mailers, and inserts"},
        )

        # 3) Units of measure
        pcs_uom, _ = UnitOfMeasure.objects.get_or_create(
            code="PCS",
            defaults={"name": "Pieces", "description": "Individual units"},
        )
        kg_uom, _ = UnitOfMeasure.objects.get_or_create(
            code="KG",
            defaults={"name": "Kilograms", "description": "Weight in kilograms"},
        )
        box_uom, _ = UnitOfMeasure.objects.get_or_create(
            code="BOX",
            defaults={"name": "Boxes", "description": "Standard carton"},
        )
        kit_uom, _ = UnitOfMeasure.objects.get_or_create(
            code="KIT",
            defaults={"name": "Kits", "description": "Pre-packaged maintenance kits"},
        )
        pack_uom, _ = UnitOfMeasure.objects.get_or_create(
            code="PACK",
            defaults={"name": "Packs", "description": "Bundled mailers"},
        )

        # 3) Warehouses
        main_wh, _ = Warehouse.objects.get_or_create(
            code="WH-001",
            defaults={"name": "Main Warehouse"},
        )
        secondary_wh, _ = Warehouse.objects.get_or_create(
            code="WH-002",
            defaults={"name": "Secondary Warehouse"},
        )
        micro_hub, _ = Warehouse.objects.get_or_create(
            code="WH-003",
            defaults={"name": "Micro Fulfillment Hub"},
        )

        # 4) Products
        laptop, _ = Product.objects.get_or_create(
            sku="LAP-001",
            defaults={
                "name": "Laptop 15-inch",
                "category": electronics,
                "stock_unit": pcs_uom,
                "purchase_unit": pcs_uom,
                "reorder_level": Decimal("5"),
                "reorder_quantity": Decimal("20"),
            },
        )
        steel, _ = Product.objects.get_or_create(
            sku="STL-001",
            defaults={
                "name": "Steel Rods",
                "category": raw,
                "stock_unit": kg_uom,
                "purchase_unit": kg_uom,
                "reorder_level": Decimal("50"),
                "reorder_quantity": Decimal("200"),
            },
        )
        box, _ = Product.objects.get_or_create(
            sku="BOX-001",
            defaults={
                "name": "Cardboard Box",
                "category": raw,
                "stock_unit": box_uom,
                "purchase_unit": box_uom,
                "reorder_level": Decimal("30"),
                "reorder_quantity": Decimal("100"),
            },
        )
        tablet, _ = Product.objects.get_or_create(
            sku="TAB-201",
            defaults={
                "name": "Tablet 11-inch Pro",
                "category": electronics,
                "stock_unit": pcs_uom,
                "purchase_unit": pcs_uom,
                "reorder_level": Decimal("8"),
                "reorder_quantity": Decimal("30"),
            },
        )
        servo_drive, _ = Product.objects.get_or_create(
            sku="DRV-050",
            defaults={
                "name": "Precision Servo Drive",
                "category": electronics,
                "stock_unit": pcs_uom,
                "purchase_unit": pcs_uom,
                "reorder_level": Decimal("3"),
                "reorder_quantity": Decimal("12"),
            },
        )
        battery_pack, _ = Product.objects.get_or_create(
            sku="BAT-500",
            defaults={
                "name": "Lithium Battery Pack",
                "category": spares,
                "stock_unit": pcs_uom,
                "purchase_unit": pcs_uom,
                "reorder_level": Decimal("15"),
                "reorder_quantity": Decimal("40"),
            },
        )
        filament, _ = Product.objects.get_or_create(
            sku="FIL-120",
            defaults={
                "name": "Nylon Filament 12kg",
                "category": raw,
                "stock_unit": kg_uom,
                "purchase_unit": kg_uom,
                "reorder_level": Decimal("25"),
                "reorder_quantity": Decimal("75"),
            },
        )
        maint_kit, _ = Product.objects.get_or_create(
            sku="KIT-900",
            defaults={
                "name": "Maintenance Kit Deluxe",
                "category": spares,
                "stock_unit": kit_uom,
                "purchase_unit": kit_uom,
                "reorder_level": Decimal("6"),
                "reorder_quantity": Decimal("18"),
            },
        )
        mailer_pack, _ = Product.objects.get_or_create(
            sku="PKG-250",
            defaults={
                "name": "Eco Mailer Pack",
                "category": packaging,
                "stock_unit": pack_uom,
                "purchase_unit": pack_uom,
                "reorder_level": Decimal("40"),
                "reorder_quantity": Decimal("120"),
            },
        )
        sensor, _ = Product.objects.get_or_create(
            sku="SEN-330",
            defaults={
                "name": "Temperature Sensor Module",
                "category": electronics,
                "stock_unit": pcs_uom,
                "purchase_unit": pcs_uom,
                "reorder_level": Decimal("20"),
                "reorder_quantity": Decimal("60"),
            },
        )

        # 5) Stock levels
        StockItem.objects.get_or_create(
            product=laptop,
            warehouse=main_wh,
            defaults={"quantity": Decimal("40"), "reserved_quantity": Decimal("5")},
        )
        StockItem.objects.get_or_create(
            product=steel,
            warehouse=main_wh,
            defaults={"quantity": Decimal("500"), "reserved_quantity": Decimal("0")},
        )
        StockItem.objects.get_or_create(
            product=box,
            warehouse=secondary_wh,
            defaults={"quantity": Decimal("150"), "reserved_quantity": Decimal("10")},
        )
        stock_matrix = [
            (tablet, main_wh, Decimal("28"), Decimal("4")),
            (servo_drive, main_wh, Decimal("12"), Decimal("2")),
            (battery_pack, secondary_wh, Decimal("60"), Decimal("5")),
            (filament, main_wh, Decimal("210"), Decimal("15")),
            (maint_kit, micro_hub, Decimal("18"), Decimal("1")),
            (mailer_pack, micro_hub, Decimal("240"), Decimal("20")),
            (sensor, secondary_wh, Decimal("95"), Decimal("8")),
        ]
        for product, warehouse, qty, reserved in stock_matrix:
            StockItem.objects.get_or_create(
                product=product,
                warehouse=warehouse,
                defaults={"quantity": qty, "reserved_quantity": reserved},
            )

        # 6) Suppliers
        Supplier.objects.get_or_create(
            code="SUP-001",
            defaults={"name": "Global Electronics", "email": "sales@globalelec.test"},
        )
        Supplier.objects.get_or_create(
            code="SUP-002",
            defaults={"name": "Steel Corp", "email": "contact@steelcorp.test"},
        )
        Supplier.objects.get_or_create(
            code="SUP-003",
            defaults={"name": "Northern Components", "email": "hello@northerncomponents.test"},
        )
        Supplier.objects.get_or_create(
            code="SUP-004",
            defaults={"name": "EcoPack Solutions", "email": "sales@ecopack.test"},
        )

        # 7) A few demo operations (one receipt, one delivery, one transfer, one adjustment)
        # Only create if none exist, to keep the DB tidy.
        if not Receipt.objects.exists():
            receipt = Receipt.objects.create(
                warehouse=main_wh,
                supplier="Global Electronics",
                supplier_reference="PO-1001",
                created_by=demo_user,
                status="ready",
            )
            ReceiptItem.objects.create(
                receipt=receipt,
                product=laptop,
                quantity_ordered=Decimal("10"),
                quantity_received=Decimal("10"),
                unit_price=Decimal("800.00"),
            )
            receipt.validate_and_complete()

        if not DeliveryOrder.objects.exists():
            delivery = DeliveryOrder.objects.create(
                warehouse=main_wh,
                customer="Acme Corp",
                customer_reference="SO-2001",
                shipping_address="123 Business St",
                created_by=demo_user,
                status="ready",
            )
            DeliveryItem.objects.create(
                delivery=delivery,
                product=laptop,
                quantity=Decimal("2"),
            )
            delivery.validate_and_complete()

        if not InternalTransfer.objects.exists():
            transfer = InternalTransfer.objects.create(
                warehouse=main_wh,
                to_warehouse=secondary_wh,
                created_by=demo_user,
                status="ready",
                notes="Initial stock balancing",
            )
            TransferItem.objects.create(
                transfer=transfer,
                product=steel,
                quantity=Decimal("50"),
            )
            transfer.validate_and_complete()

        if not StockAdjustment.objects.exists():
            adjustment = StockAdjustment.objects.create(
                warehouse=secondary_wh,
                reason="Year-end count correction",
                adjustment_type="set",
                created_by=demo_user,
                status="ready",
            )
            AdjustmentItem.objects.create(
                adjustment=adjustment,
                product=box,
                current_quantity=Decimal("150"),
                adjustment_quantity=Decimal("140"),
                reason="10 damaged boxes removed",
            )
            adjustment.validate_and_complete()

        # Targeted demo documents to highlight the new SKUs (idempotent per reference)
        if not Receipt.objects.filter(supplier_reference="PO-HUB-301").exists():
            hub_receipt = Receipt.objects.create(
                warehouse=micro_hub,
                supplier="Northern Components",
                supplier_reference="PO-HUB-301",
                created_by=demo_user,
                status="ready",
            )
            ReceiptItem.objects.create(
                receipt=hub_receipt,
                product=battery_pack,
                quantity_ordered=Decimal("25"),
                quantity_received=Decimal("25"),
                unit_price=Decimal("55"),
            )
            ReceiptItem.objects.create(
                receipt=hub_receipt,
                product=maint_kit,
                quantity_ordered=Decimal("10"),
                quantity_received=Decimal("10"),
                unit_price=Decimal("95"),
            )
            hub_receipt.validate_and_complete()

        if not Receipt.objects.filter(supplier_reference="PO-ECO-112").exists():
            eco_receipt = Receipt.objects.create(
                warehouse=secondary_wh,
                supplier="EcoPack Solutions",
                supplier_reference="PO-ECO-112",
                created_by=demo_user,
                status="ready",
            )
            ReceiptItem.objects.create(
                receipt=eco_receipt,
                product=mailer_pack,
                quantity_ordered=Decimal("120"),
                quantity_received=Decimal("120"),
                unit_price=Decimal("12.50"),
            )
            eco_receipt.validate_and_complete()

        if not DeliveryOrder.objects.filter(customer_reference="SO-RED-88").exists():
            sensor_delivery = DeliveryOrder.objects.create(
                warehouse=secondary_wh,
                customer="Redline Robotics",
                customer_reference="SO-RED-88",
                shipping_address="22 Automation Way",
                created_by=demo_user,
                status="ready",
            )
            DeliveryItem.objects.create(
                delivery=sensor_delivery,
                product=sensor,
                quantity=Decimal("12"),
            )
            DeliveryItem.objects.create(
                delivery=sensor_delivery,
                product=servo_drive,
                quantity=Decimal("4"),
            )
            sensor_delivery.validate_and_complete()

        if not InternalTransfer.objects.filter(notes="Balancing tablets to hub").exists():
            tablet_transfer = InternalTransfer.objects.create(
                warehouse=main_wh,
                to_warehouse=micro_hub,
                created_by=demo_user,
                status="ready",
                notes="Balancing tablets to hub",
            )
            TransferItem.objects.create(
                transfer=tablet_transfer,
                product=tablet,
                quantity=Decimal("6"),
            )
            tablet_transfer.validate_and_complete()

        if not StockAdjustment.objects.filter(reason="Routine servo calibration loss").exists():
            servo_adjustment = StockAdjustment.objects.create(
                warehouse=main_wh,
                reason="Routine servo calibration loss",
                adjustment_type="remove",
                created_by=demo_user,
                status="ready",
            )
            AdjustmentItem.objects.create(
                adjustment=servo_adjustment,
                product=servo_drive,
                current_quantity=Decimal("12"),
                adjustment_quantity=Decimal("10"),
                reason="2 drives consumed during calibration",
            )
            servo_adjustment.validate_and_complete()

        # 8) Always add a bit more demo activity on each run so the UI looks busy
        #    This is intentionally not idempotent: re-running the command will
        #    create more history (useful for demos).

        # Extra receipts (increase stock)
        for i in range(3):
            extra_receipt = Receipt.objects.create(
                warehouse=main_wh,
                supplier="Global Electronics" if i % 2 == 0 else "Steel Corp",
                supplier_reference=f"PO-EXTRA-{100 + i}",
                created_by=demo_user,
                status="ready",
            )
            if i % 2 == 0:
                ReceiptItem.objects.create(
                    receipt=extra_receipt,
                    product=laptop,
                    quantity_ordered=Decimal("5"),
                    quantity_received=Decimal("5"),
                    unit_price=Decimal("780.00"),
                )
            else:
                ReceiptItem.objects.create(
                    receipt=extra_receipt,
                    product=steel,
                    quantity_ordered=Decimal("100"),
                    quantity_received=Decimal("100"),
                    unit_price=Decimal("2.50"),
                )
            extra_receipt.validate_and_complete()

        # Extra small delivery (reduce stock a bit)
        extra_delivery = DeliveryOrder.objects.create(
            warehouse=main_wh,
            customer="Demo Customer",
            customer_reference="SO-EXTRA-1",
            shipping_address="456 Demo Ave",
            created_by=demo_user,
            status="ready",
        )
        DeliveryItem.objects.create(
            delivery=extra_delivery,
            product=laptop,
            quantity=Decimal("1"),
        )
        extra_delivery.validate_and_complete()

        # Extra transfer between warehouses
        extra_transfer = InternalTransfer.objects.create(
            warehouse=main_wh,
            to_warehouse=secondary_wh,
            created_by=demo_user,
            status="ready",
            notes="Auto-generated demo transfer",
        )
        TransferItem.objects.create(
            transfer=extra_transfer,
            product=steel,
            quantity=Decimal("20"),
        )
        extra_transfer.validate_and_complete()

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
